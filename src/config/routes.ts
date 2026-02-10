export const routes = {
  private: {
    dashboard: "/dashboard",
    logout: "/api/auth/logout",
  },
  public: {
    home: "/",
    login: "/login",
  },
} as const;

export const isPrivateRoute = (path: string) => {
  return Object.values(routes.private).some((privatePath) =>
    path.startsWith(privatePath),
  );
};
