const Category = ({ img, width = "50%", height = "50%" }) => {
  return (
    <>
      <img id="icons" src={img} width={width} height={height} alt="icons" />
    </>
  );
};

export default Category;
