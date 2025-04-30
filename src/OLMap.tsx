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
