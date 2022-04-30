export const GetStatic = (dir: string, fileName: string) => {
  return new URL(`../static/${dir}/${fileName}`, import.meta.url).href;
};

export const GetIMG = (fileName: string) => GetStatic("images", fileName);
