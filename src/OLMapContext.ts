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