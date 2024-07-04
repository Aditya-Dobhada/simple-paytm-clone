import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import {jwtDecode} from 'jwt-decode'
import { useNavigate } from "react-router-dom";

axios.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = "Bearer " + token;
    }
    return config;
  }
);


export function Users() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [CurrentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      setCurrentUser(decodedToken.userId);
    }
  }, [CurrentUser])

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/user/bulk?filter=' + filter)
    .then((res) => {
      setUsers(res.data.user);
      })
  }, [filter])

  const filteredUsers = users.filter(user => user._id !== CurrentUser)

  return (
    <>
      <div className="font-bold mt-6 text-lg">Users</div>
      <div className="my-2">
        <input onChange={(e) => {
          setFilter(e.target.value);
        }}
          type="text"
          placeholder="Search users..."
          className="w-full px-2 py-1 border rounded border-slate-200"
        ></input>
      </div>
      <div>
        {filteredUsers.map((user) => (
          <User key={user._id} user={user} />
        ))}
      </div>
    </>
  );
};

function User({ user }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between">
      <div className="flex">
        <div className="rounded-full h-12 w-12 bg-slate-200 flex justify-center mt-1 mr-2">
          <div className="flex flex-col justify-center h-full text-xl">
            {user.firstName[0]}
          </div>
        </div>
        <div className="flex flex-col justify-center h-ful">
          <div>
            {user.firstName} {user.lastName}
            <div className="text-slate-400">{user.username}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center h-ful pt-2.5">
        <Button
          onClick={() => {
            navigate(
              `/send?id=${user._id}&name=${user.firstName} ${user.lastName}&username=${user.username}`
            );
          }}
          label={"Send Money"}
        />
      </div>
    </div>
  );
}
