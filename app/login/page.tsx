import Link from "next/link";

const login = () => {
    return (
        <>
            <div className="container d-flex justify-content-center align-items-center vh-100">
                <div className="card p-4" style={{ width: 400 }}>
                    <h3 className="text-center">Login</h3>
                    <form>
                        <input
                            className="form-control mb-2"
                            name="email"
                            type="email"
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form-control mb-2"
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                        />
                        <button className="btn btn-primary w-100" type="submit">
                            Login
                        </button>
                    </form>
                    <p className="mt-3 text-center">
                        Don't have an account? <Link href="/register">Register</Link>
                    </p>
                </div>
            </div>
        </>
    );
}
export default login;
