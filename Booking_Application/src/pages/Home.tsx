import { useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="text-center">
        <h1>Welcome to Booking Application</h1>
        <CustomButton
          size="small"
          label="login"
          onClick={() => navigate("/login")}
        />
      </div>
    </>
  );
};

export default Home;
