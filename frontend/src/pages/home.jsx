import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import issueImg from "../assets/hub-issue-sticker.jpg";
import balanceImg from "../assets/hub-balance-sticker.jpg";
import addImg from "../assets/hub-add-sticker.jpg";
import productivityImg from "../assets/hub-productivity.jpg";

const HUB_ITEMS = [
  {
    to: "/issue-sticker",
    image: issueImg,
    title: "Issue Sticker",
    sub: "Hand out sheets to a table",
  },
  {
    to: "/balance-sticker",
    image: balanceImg,
    title: "Balance Sticker",
    sub: "Reconcile returned work",
  },
  {
    to: "/add-sticker",
    image: addImg,
    title: "Add Sticker Type",
    sub: "Register a new sticker",
  },
  {
    to: "/productivity",
    image: productivityImg,
    title: "Productivity",
    sub: "View table-wise output",
  },
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="page">
      <Navbar title="Home" />
      <main className="page-content home-content">
        <p className="page-intro">
          Welcome back, {user?.userName}. What would you like to do?
        </p>

        <div className="hub-center-wrap">
          <div className="hub-grid">
            {HUB_ITEMS.map((item) => (
              <Link key={item.to} to={item.to} className="hub-card">
                <div className="hub-card-image-wrap">
                  <img src={item.image} alt={item.title} className="hub-card-image" />
                </div>
                <div className="hub-card-labels">
                  <span className="hub-card-title">{item.title}</span>
                  <span className="hub-card-sub">{item.sub}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;