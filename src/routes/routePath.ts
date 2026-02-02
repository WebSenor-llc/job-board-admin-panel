const routePath = {
  DASHBOARD: "/dashboard",
  AUTH: {
    LOGIN: "/login",
  },
  USER: {
    LIST: "/users/list",
    CREATE: "/users/create",
    EDIT: "/users/edit/:id",
    DETAILS: "/users/details/:id",
  },
  ROLE: {
    LIST: "/roles/list",
    CREATE: "/roles/create",
    EDIT: "/roles/edit/:id",
  },
  MEMBER: {
    LIST: "/members/list",
    CREATE: "/members/create",
    EDIT: "/members/edit/:id",
    DETAILS: "/members/details/:id",
  },
  MODERATION: {
    LIST: "/moderation/list",
    DETAILS: "/moderation/details/:id",
  },
  POST: {
    LIST: "/posts/list",
    CREATE: "/posts/create",
    EDIT: "/posts/edit/:id",
    DETAILS: "/posts/details/:id",
  },
};

export default routePath;
