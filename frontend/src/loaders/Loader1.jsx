import Reat from "react";
import "./loader1.css";
const Loader1 = ({theme})=>{
	return (
		<div className={` ${!theme && "main-dark"}`}>
		<div className = {`spinner w-12 h-12 rounded-full border-2`}>
			
		</div>
		</div>
	)
}
export default Loader1;
