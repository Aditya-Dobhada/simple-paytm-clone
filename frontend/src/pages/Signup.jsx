import { Heading } from "../components/Heading";
import { SubHeading } from "../components/SubHeading";
import { InputBox } from "../components/InputBox";
import { Button } from "../components/Button";
import { BottomWarning } from "../components/BottomWarning";
import { useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";


export function Signup() {
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tokenReceived, setTokenReceived] = useState(false);

  if (localStorage.getItem("token")) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="bg-slate-300 h-screen flex justify-center">
      <div className="flex flex-col justify-center">
        <div className="rounded-lg bg-white w-80 text-center p-2 h-max px-4">
          <Heading label={"Sign up"} />
          <SubHeading label={"Enter your information to create an account"} />

          <InputBox
            onChange={(e) => {
              setFirstname(e.target.value);
            }}
            label={"First Name"}
            placeholder={"John"}
          />

          <InputBox
            onChange={(e) => {
              setLastname(e.target.value);
            }}
            label={"Last Name"}
            placeholder={"Doe"}
          />

          <InputBox
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            label={"Email"}
            placeholder={"johndoe@gmail.com"}
          />

          <InputBox
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            label={"Password"}
            placeholder={""}
            type={"password"}
          />

          <div className="pt-4">
            <Button
              onClick={async () => {
                const res = await axios.post(
                  "http://localhost:3000/api/v1/user/signup",
                  {
                    username,
                    password,
                    firstName,
                    lastName,
                  }
                );
                if (res.data.token) {
                  localStorage.setItem("token", res.data.token);
                  setTokenReceived(true);
                }
              }}
              label={"Sign up"}
            />
          </div>
          <BottomWarning
            label={"Already have an account?"}
            buttonText={"Sign in"}
            to={"/signin"}
          />
        </div>
      </div>
      {tokenReceived && <Navigate to="/dashboard" />}
    </div>
  );
}
