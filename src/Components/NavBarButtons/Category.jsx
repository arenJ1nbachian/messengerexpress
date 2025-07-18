/**
 * Category component renders an image with specified dimensions.
 *
 * @param {object} props - The properties object.
 * @param {string} props.img - The source URL of the image.
 * @param {string} [props.width="50%"] - The width of the image.
 * @param {string} [props.height="50%"] - The height of the image.
 * @returns {JSX.Element} The rendered image component.
 */
const Category = ({ img, width = "100%", height = "100%" }) => {
  return (
    <>
      {/* Render an image element with the given source, width, and height */}
      <img id="icons" src={img} width={width} height={height} alt="icons" />
    </>
  );
};

export default Category;
