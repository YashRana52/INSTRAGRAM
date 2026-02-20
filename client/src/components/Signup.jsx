import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { Loader2 } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signupUser } from "@/redux/slice/authSlice";

function Signup() {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((state) => state.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const SignupHandler = async (e) => {
    e.preventDefault();
    dispatch(signupUser(input));
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={SignupHandler}
        className="shadow-lg flex flex-col gap-5 p-8"
      >
        <div className="flex flex-col items-center my-4">
          <img
            src="/image.png"
            alt="Instagram Logo"
            className="h-20 w-20 mb-3"
          />
          <p className="text-center text-gray-700 text-base font-medium">
            Connect with your friends and share your moments.
          </p>
        </div>
        <div>
          <span className="font-medium">Username</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        <div>
          <span className="font-medium">Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>
        {loading ? (
          <Button>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please Wait
          </Button>
        ) : (
          <Button type="submit">Signup</Button>
        )}

        <span className="text-center">
          Already have an account?
          <Link to="/login" className="text-blue-600 font-medium ml-2">
            Login
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Signup;
