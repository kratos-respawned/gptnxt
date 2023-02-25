// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { openai } from "@/utils/openAI";
// type Data = {
//   error?: string;

//   msg?: string;
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt, model = "gpt" } = req.body;
  if (!prompt) {
    // Send a 400 status code and a message indicating that the prompt is missing
    return res.status(400).send("Prompt is missing in the request");
  }
  try {
    // Use the OpenAI SDK to create a completion
    // with the given prompt, model and maximum tokens
    if (model === "image") {
      const result = await openai.createImage({
        prompt,
        response_format: "url",
        size: "512x512",
      });
      if (!result.data.data[0].url)
        return res.status(500).send("No image found");
      return res.send(result.data.data[0].url);
    }
    const completion = await openai.createCompletion({
      model: model === "gpt" ? "text-davinci-003" : "code-davinci-002", // model name
      prompt: `Please reply below question in markdown format.\n ${prompt}`, // input prompt
      max_tokens: model === "gpt" ? 4000 : 8000, // Use max 8000 tokens for codex model
    });
    // Send the generated text as the response
    return res.send(completion.data.choices[0].text);
  } catch (error: any) {
    // If there is an error, log it to the console
    console.log(error.message);
    // const errorMsg = error.response ? error.response.data.error : `${error}`;
    // console.error(errorMsg);
    // Send a 500 status code and the error message as the response
    return res.status(500).send(error.message);
  }
}
