const Footer = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        backgroundColor: "#7c96b7", // css changes
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: 64,
        color: "white",
        boxSizing: "border-box", // Include padding and border in the total height
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 600 }}>Footer</div>
    </div>
  );
};

export default Footer;
