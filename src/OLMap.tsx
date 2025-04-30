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
        <div>
            <div ref={mapRef} id="map"/>
        </div>
    )
}
