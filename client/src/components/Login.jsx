import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { loadUser, loginUser } from "@/redux/slice/authSlice";

function Login() {
  const { loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };
  const loginHandler = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUser(input));

    if (loginUser.fulfilled.match(res)) {
      await dispatch(loadUser());
      navigate("/");
    }
  };

  return (
    <div className="flex items-center w-screen h-screen justify-center">
      <form
        onSubmit={loginHandler}
        className="shadow-lg flex flex-col gap-5 p-8 w-96"
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
          <span className="font-medium">Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
            required
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
            required
          />
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </>
          ) : (
            "Login"
          )}
        </Button>

        <span className="text-center text-gray-700">
          Do not have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium">
            Sign up
          </Link>
        </span>
      </form>
    </div>
  );
}

export default Login;
