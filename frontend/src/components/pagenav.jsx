import { Link } from "react-router-dom";

// Renders the exact nav button set each page in Section 6 specifies,
// e.g. IssueSticker: ['home', 'balance', 'add']
const LINKS = {
  home: { to: "/home", label: "Back to Home" },
  issue: { to: "/issue-sticker", label: "Go to Issue Sticker" },
  balance: { to: "/balance-sticker", label: "Go to Balance Sticker" },
  add: { to: "/add-sticker", label: "Go to Add Sticker" },
  productivity: { to: "/productivity", label: "Go to Productivity" },
};

const PageNav = ({ links = [] }) => (
  <div className="page-nav">
    {links.map((key) => (
      <Link key={key} to={LINKS[key].to} className="btn btn-secondary">
        {LINKS[key].label}
      </Link>
    ))}
  </div>
);

export default PageNav;