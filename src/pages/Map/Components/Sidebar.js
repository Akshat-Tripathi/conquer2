import './Sidebar.css';
import React from 'react';

export const SidebarGeneral = ({ width, height, children, title }) => {
	const [ xPosition, setX ] = React.useState(-width);

	const toggleMenu = () => {
		if (xPosition < 0) {
			setX(0);
		} else {
			setX(-width);
		}
	};

	React.useEffect(() => {
		setX(0);
	}, []);

	return (
		<React.Fragment>
			<div
				className="side-bar"
				style={{
					transform: `translatex(${xPosition}px)`,
					width: width,
					minHeight: height,
					position: 'fixed'
				}}
			>
				<button
					onClick={() => toggleMenu()}
					className="toggle-menu"
					style={{
						transform: `translate(${width}px, 20vh)`
					}}
				>
					<p
						style={{
							writingMode: 'vertical-rl',
							textOrientation: 'sideways',
							color: 'black',
							transform: `translate(${10}px)`,
							textShadow: '0 0 10px #fff'
						}}
					>
						{title}
					</p>
				</button>
				<div className="sidebar-content">{children}</div>
			</div>
		</React.Fragment>
	);
};

const Sidebar = ({ children, title }) => {
	return (
		<SidebarGeneral width={300} height={'100vh'} title={'Players'}>
			{<h1>Hello</h1>}
		</SidebarGeneral>
	);
};

export default SidebarGeneral;
export { Sidebar };
