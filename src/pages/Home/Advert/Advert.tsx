import React from "react";
import "./index.css"
import img from "../../../img/广告.png"

const Advert = () => {
    return <div className="ad-div comm-box">
        <div><img src={img} alt="" /></div>
        <div><img src={img} alt="" /></div>
        <div><img src={img} alt="" /></div>
        <div><img src={img} alt="" /></div>
    </div>
}

export default Advert;