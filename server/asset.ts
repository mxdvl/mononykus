import { getMimeType } from "./mime.ts";

export const getAsset = async (
  pathname: string
): Promise<Response | undefined> => {
  try {
    const file = await Deno.readFile(
      new URL(`../build/client/${pathname}`, import.meta.url)
    );

    return new Response(file, {
      headers: {
        "Content-Type": getMimeType(pathname),
      },
    });
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return undefined;
    }
    throw error;
  }
};
