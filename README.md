# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```
## Setup and install dependencies

```
git clone https://github.com/ntu-pear/PEAR_WebFE.git
npm i
```

## Environment Configuration
Make sure to create a .env file in the PEAR_WebFE folder. For instructions on how to configure this file, refer to the Confluence page:

Click on the link to be redirect to the confluence page --> [Confluence Page](https://fyppear.atlassian.net/wiki/spaces/FP/pages/112754944/PEAR+Web+Pages+Frontend)

## Running the Application
Before running, make sure to connect to NTU VPN first using GlobalProtect. If not, the web application would not be able to access any of the microservices.

```
npm run dev
```

## Before Commiting and Pushing to Github

To check if can build successfully, and resolve any error before commiting
```
npm run build 
```
To format the code with prettier
```
npm run format 
```











