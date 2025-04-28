import React from "react";
import "./index.css"
import ElementRotation from '../ElementRotation'

const Footer = () => {
    return <div className="footer-div">
        <div>系统是由<ElementRotation text={'曦景'} />在实习中熬夜看技术胖使用React+Node+Ant Design写的</div>
        <div>xiJing.com</div>
    </div>
}

export default Footer;