# Developing Web Maps with OpenLayers React
[OpenLayers](https://openlayers.org/) is a robust free and open source library for displaying web maps. [React](https://react.dev/) is a popular free and open source library for building user interfaces. Together, the two libraries are a powerful way to develop web map applications: React can handle the bulk of the user interface and delegate displaying the map to OpenLayers.

This demonstrates a simple and flexible way to integrate OpenLayers and React. It can be used as a tutorial, though familiarity with the basics of both OpenLayers and React is assumed.

# OpenLayers
The two most important parts of an OpenLayers project is the markup with a `div` element and a script that attaches a map to that `div`.

For example

```html
index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>
    <div id="map"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

```js
main.js

import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
```

The OpenLayers map is initialised with its `target` property set to `map`. OpenLayers will find a `div` with the id `map` and attach the map to that `div`.

# Integrating OpenLayers into a React Project
Following from above, to display an OpenLayers map in React, we need a React component that initialises an OpenLayers map and returns a `div` for that map to attach to.

## Setting Up
First build a React project. We can [use a framework](https://react.dev/learn/creating-a-react-app) like Next or [build a React project from scratch](https://react.dev/learn/build-a-react-app-from-scratch) using a build tool like Vite. Either way, after the starter React project is built, install OpenLayers
```
npm install ol
# or
yarn add ol
```

## The Naive Implementation
A naive implementation would be to create a component that renders a `div`, initialise an OpenLayers map object in the same component and set the map target to that `div`, as follows:

```ts
OLMap.tsx

import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"

export default function OLMap(){
    const olMap = new Map({
        target: 'map',
        layers : [
            new TileLayer({
                source: new OSM(),
            })
        ],
        view: new View({
            center: [0, 0],
            zoom: 2,
        })
    })
    
    return (
        <div id="map"/>
    )
}
```

However this will not work. In this implementation the map is initialised first, and then the `div` is renderer. But for OpenLayers to attach the map to the `div`, it must be rendered first.

## The Basic Implementation
The `useEffect` hook lets us run code after the component renders, so it can be used to synchronise OpenLayers with React and attach the map to the `div` after the `div` renders.

```ts
OLMap.tsx

import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"

import { useEffect, useRef } from "react"

export default function OLMap(){
    const mapRef = useRef(null);

    useEffect(() => {
        const olMap = new Map({
            target: mapRef.current!,
            layers : [
                new TileLayer({
                    source: new OSM(),
                })
            ],
            view: new View({
                center: [0, 0],
                zoom: 2,
            })
        })

        return () => {olMap.setTarget(undefined)};
    }, [])


    return (
        <div ref={mapRef} id="map"/>
    )
}
```

Now after the component renders for the first time, the function defined in `useEffect` will run. This initialises the map and attaches it to the target `div`. 

Note that instead of hardcoding the map target, this uses a [Ref](https://react.dev/learn/manipulating-the-dom-with-refs) to get a reference to the DOM element where the map should be rendered. In this case, that DOM node is a `div`. First, `const mapRef = useRef(null);` declares a ref inside the component. Then `<div ref={mapRef} id="map"/>` passes the ref to the tag for which we want the DOM node. Finally  `target: mapRef.current!`, gets the DOM node associated with the ref and sets it as the target for the map.

## The Better Implementation
The above method works, but has the limitation that the OpenLayers map instance is only available in the same component that renders that map. In a typical application we might have many components that need access to the map, for instance to add and remove map layers or enable and disable certain map modes. 

We could instantiate the map somewhere high above in the component tree and pass it down as a prop to all the components that need it, but this is unwieldy. Furthermore, the map instance and the component that renders the map are tightly coupled, making it difficult to change where the map is rendered.

Rather than initialise the map in the component that renders it, we can initialise and provide the map in a [Context](https://react.dev/learn/passing-data-deeply-with-context).  A Context allows us to make a value available globally.

First we create the context and provide the map instance as the default value for this context

```ts
OLMapContext.ts

import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import { OSM } from "ol/source"
import { createContext } from "react"

export const OLMapContext = createContext(new Map({
    layers : [
        new TileLayer({
            source: new OSM(),
        })
    ],
    view: new View({
        center: [0, 0],
        zoom: 2,
    })
}));
```

Note that the map has been initialised without the `target` property. We simply initialise the map in the Context, but do not make any assumptions about where it will be attached.

Now any component that needs access to the map instance, including the component that renders it, can access it with the `useContext` hook.

For example, we can now attach the map to a `div` as follows

```ts
OLMap.tsx

import { useContext, useEffect, useRef } from "react"
import { OLMapContext } from "./OlMapContext";

export default function OLMap(){
    const olMap = useContext(OLMapContext);
    const mapRef = useRef(null);

    useEffect(() => {
        olMap.setTarget(mapRef.current!);

        return () => {olMap.setTarget(undefined)};
    }, [])

    return (
        <div>Then a
            <div ref={mapRef} id="map"/>
        </div>
    )
}
```

`useContext(OLMapContext)` returns the value contained in the context, which mappens to be an OpenLayers map instance.
As before, after the component renders for the first time, the code in `useEffect` will run. In this case, it simply sets the map target.

This decouples the map instance from the component that renders it. Meaning that we can place the component that renders the map anywhere in the component tree. 

Note that we did not use any context providers. A context provider sets the context value for every component that appears in the component tree below that provider. Since we only need one global map instance and that instance never changes, there is no need to use providers.

## Other Considerations
This has covered how OpenLayers renders a map, but not what that map looks like. The dimensions of the map are determined by the `css`. In this example, the `div` that contains the map has the `id="map"` and the the css selector styles it as follows:
```css
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
```
Which causes the map to take up the whole screen. 

Different applicatons will need to set the map size differently, perhaps depending on the size of other UI elements. There are too many possibilities to cover here.