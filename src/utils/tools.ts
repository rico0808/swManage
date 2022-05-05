export const GetStatic = (dir: string, fileName: string) => {
  return new URL(`../static/${dir}/${fileName}`, import.meta.url).href;
};

export const GetIMG = (fileName: string) => GetStatic("images", fileName);

export const toGB = (val: number) => {
  return Number((val / 1024 / 1024).toFixed(2));
};
