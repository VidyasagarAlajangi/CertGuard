import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../authSlice";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [role, setRole] = useState("user"); // 'user' or 'company'
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    website: "",
    isoCertificateUrl: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupRole, setSignupRole] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      role,
    };

    const result = await dispatch(signup(payload));
    if (result.meta.requestStatus === "fulfilled") {
      const userRole = result.payload.user.role;
      setSignupRole(userRole);
      setSignupSuccess(true);
      if (userRole === "user") {
        navigate("/");
      }
    }
  };

  return (
    <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mt-10">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          Sign Up
        </h2>

        {signupSuccess && signupRole === "company" ? (
          <div className="text-center text-blue-700 text-lg font-semibold py-8">
            Your institute account has been created and is <span className="text-yellow-600">pending approval</span> by the admin.<br/>
            You will be notified once your account is activated.<br/>
            <a href="/login" className="underline text-blue-600 mt-4 inline-block">Go to Login</a>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
          >
            <option value="user">Individual User</option>
            <option value="company">Institute / Company</option>
          </select>

          <input
            name="name"
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
          />

          {role === "company" && (
            <>
              <input
                name="phone"
                type="text"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
              />
              <input
                name="address"
                type="text"
                placeholder="Company Address"
                value={formData.address}
                onChange={handleChange}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
              />
              <input
                name="website"
                type="text"
                placeholder="Company Website"
                value={formData.website}
                onChange={handleChange}
                className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
              />
                <input
                  name="isoCertificateUrl"
                  type="text"
                  placeholder="ISO Certificate URL"
                  value={formData.isoCertificateUrl}
                  onChange={handleChange}
                  className="border-2 border-blue-200 rounded-lg px-4 py-3 text-lg"
                />
            </>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 font-semibold text-lg shadow transition"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}
        </form>
        )}

        <div className="text-center mt-4 text-blue-600">
          Already have an account?{" "}
          <a href="/login" className="underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};
export default Signup;
