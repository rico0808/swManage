/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    label: string;
    showMenu?: boolean;
    roles?: Array<string>;
    isPublic?: boolean;
    isAuth?: boolean;
    isPriavte?: boolean;
  }
}
