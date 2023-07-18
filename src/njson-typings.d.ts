// allows to use .json files as import
declare module "*.json" {
    const value: any;
    export default value;
  }
  