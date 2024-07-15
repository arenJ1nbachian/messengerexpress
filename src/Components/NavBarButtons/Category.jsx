const Category = ({ img, width = "50%", height = "50%" }) => {
  return (
    <>
      <img src={img} width={width} height={height} alt="icons" />
    </>
  );
};

export default Category;
