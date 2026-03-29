import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaShoppingCart, FaHeart, FaUser } from "react-icons/fa";
import SearchBar from "./SearchBar";
import SideMenu from "./SideMenu";
import { AuthContext } from "../context/AuthContext";
import { useBrandTheme } from "../context/BrandThemeContext";

/** Storefront wordmark — fixed identity (not driven by env in header). */
const WORDMARK = "TNEXT";

const wordmarkClassName =
  "font-display text-2xl sm:text-[1.75rem] font-bold text-[#000000] tracking-[0.12em] uppercase truncate group-hover:text-neutral-800 transition ease-in-out duration-200";

export default function Header() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, logout: logoutContext } = useContext(AuthContext);
  const { theme } = useBrandTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  const logout = () => {
    logoutContext();
    navigate("/");
    setMenuOpen(false);
    setProfileMenuOpen(false);
  };

  const accountHref = user ? "/profile" : "/login";
  const accountLabel = user ? "Account" : "Login";

  useEffect(() => {
    if (pathname !== "/profile") setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocMouseDown = (e) => {
      if (!profileRef.current) return;
      if (profileRef.current.contains(e.target)) return;
      setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [profileMenuOpen]);

  const goHome = (e) => {
    if (e) e.preventDefault();
    setMenuOpen(false);
    setProfileMenuOpen(false);
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-[#E5E7EB] bg-white backdrop-blur-sm pointer-events-auto">
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} user={user} onLogout={logout} />

      {/* Mobile: menu + brand + actions, then full-width search */}
      <div className="md:hidden">
        <div className="max-w-[1600px] mx-auto flex h-14 items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <button
            type="button"
            className="relative z-[102] flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors touch-manipulation"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <FaBars size={20} />
          </button>
          <Link
            to="/"
            onClick={goHome}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 sm:justify-start"
          >
            {theme.logo ? (
              <img
                src={theme.logo}
                alt={WORDMARK}
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <span className={wordmarkClassName}>{WORDMARK}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <Link
              to="/wishlist"
              className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label="Wishlist"
            >
              <FaHeart size={18} />
            </Link>
            {user && pathname === "/profile" ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
                  aria-label={accountLabel}
                >
                  <FaUser size={18} />
                </button>
                {profileMenuOpen ? (
                  <div className="absolute right-0 top-12 z-[200] min-w-[14rem] rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        navigate("/orders");
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      Orders
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            ) : user ? (
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(true);
                  navigate("/profile");
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label={accountLabel}
              >
                <FaUser size={18} />
              </button>
            ) : (
              <Link
                to={accountHref}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label={accountLabel}
              >
                <FaUser size={18} />
              </Link>
            )}
          </div>
        </div>
        <div className="px-3 pb-3 sm:px-4">
          <SearchBar placeholder="Search products" className="w-full" variant="light" />
        </div>
      </div>

      {/* Tablet: single row, nowrap — menu | logo | search (flex) | icons */}
      <div className="hidden md:flex lg:hidden max-w-[1600px] mx-auto h-[4.25rem] flex-nowrap items-center gap-3 md:gap-4 px-4 lg:px-6 min-w-0">
        <button
          type="button"
          className="relative z-[102] flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors touch-manipulation"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
        >
          <FaBars size={20} />
        </button>
        <Link to="/" onClick={goHome} className="group flex shrink-0 items-center gap-2">
          {theme.logo ? (
            <img
              src={theme.logo}
              alt={WORDMARK}
              className="h-9 w-9 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
          <span className="font-display hidden sm:inline text-xl md:text-[1.75rem] font-bold text-[#000000] tracking-[0.12em] uppercase truncate group-hover:text-neutral-800 transition ease-in-out duration-200">
            {WORDMARK}
          </span>
        </Link>
        <div className="min-w-0 flex-1 flex justify-center px-1">
          <div className="w-full max-w-xl min-w-0">
            <SearchBar placeholder="Search products" className="w-full min-w-0" variant="light" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/wishlist"
            className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
            aria-label="Wishlist"
          >
            <FaHeart size={18} />
          </Link>
          {user && pathname === "/profile" ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
                aria-label={accountLabel}
              >
                <FaUser size={18} />
              </button>
              {profileMenuOpen ? (
                <div className="absolute right-0 top-12 z-[200] min-w-[14rem] rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/orders");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : user ? (
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(true);
                navigate("/profile");
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label={accountLabel}
            >
              <FaUser size={18} />
            </button>
          ) : (
            <Link
              to={accountHref}
              className="flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 hover:bg-neutral-100 transition-colors"
              aria-label={accountLabel}
            >
              <FaUser size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Desktop: one row — [LOGO] [centered search] [actions], never wraps */}
      <div className="hidden lg:flex max-w-[1600px] mx-auto h-[4.25rem] flex-nowrap items-center gap-4 xl:gap-6 px-6 xl:px-8 min-w-0">
        <Link
          to="/"
          onClick={goHome}
          className="group flex shrink-0 items-center gap-2 xl:gap-3"
        >
          {theme.logo ? (
            <img
              src={theme.logo}
              alt={WORDMARK}
              className="h-9 w-9 xl:h-10 xl:w-10 object-contain"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
          <span className={wordmarkClassName}>{WORDMARK}</span>
        </Link>

        <div className="min-w-0 flex-1 flex justify-center px-2">
          <div className="w-full max-w-xl xl:max-w-2xl min-w-0">
            <SearchBar placeholder="Search products" className="w-full min-w-0" variant="light" />
          </div>
        </div>

        <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-2">
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="hidden xl:inline-flex shrink-0 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-700 border border-neutral-300 rounded-full hover:border-neutral-900 hover:bg-neutral-50 transition ease-in-out"
            >
              Admin Panel
            </Link>
          )}
          {!user ? (
            <>
              <Link
                to="/login"
                className="shrink-0 px-2 xl:px-3 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-widest text-[#000000] hover:text-neutral-800 transition ease-in-out"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="shrink-0 px-3 xl:px-4 py-2 text-[10px] xl:text-xs font-semibold uppercase tracking-widest bg-neutral-900 text-white rounded-full hover:bg-neutral-800 transition ease-in-out"
              >
                Join
              </Link>
            </>
          ) : (
            <span className="hidden 2xl:inline max-w-[5rem] xl:max-w-[6rem] truncate text-xs text-[#555555] shrink-0">
              {user.name?.split(" ")[0]}
            </span>
          )}
          {user && pathname === "/profile" ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:text-neutral-700 transition ease-in-out"
                aria-label={accountLabel}
              >
                <FaUser size={17} />
              </button>
              {profileMenuOpen ? (
                <div className="absolute right-0 top-12 z-[200] min-w-[14rem] rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    My Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate("/orders");
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    Orders
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : !user ? (
            <Link
              to={accountHref}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:text-neutral-700 transition ease-in-out"
              aria-label={accountLabel}
            >
              <FaUser size={17} />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setProfileMenuOpen(true);
                navigate("/profile");
              }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:text-neutral-700 transition ease-in-out"
              aria-label={accountLabel}
            >
              <FaUser size={17} />
            </button>
          )}
          <Link
            to="/wishlist"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:text-neutral-700 transition ease-in-out"
            aria-label="Wishlist"
          >
            <FaHeart size={17} />
          </Link>
          <Link
            to="/cart"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#000000] hover:text-neutral-700 transition ease-in-out"
            aria-label="Cart"
          >
            <FaShoppingCart size={17} />
          </Link>
        </div>
      </div>
    </header>
  );
}
