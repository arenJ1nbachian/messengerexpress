const Category = ({ img, width = "90%", height = "90%" }) => {
  return (
    <>
      <img src={img} width={width} height={height} alt="icons" />
    </>
  );
};

export default Category;
