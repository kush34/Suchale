import "./lineLoader.css"; 

const LineLoader = ({ width = "100%", height = 4, radius = 9999 }) => {
  return (
    <div
      className="line-loader-outer"
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    >
      <div className="line-loader-bar" />
    </div>
  );
};

export default LineLoader;
