import { execSync } from "child_process";
import axios from "axios";
import core from "@actions/core";

async function run() {
  try {
    const apiKey = core.getInput("api_key");
    const lang = core.getInput("language") || "en";
    const model = core.getInput("model") || "gpt-4o-mini";

    // get latest commit diff
    const diff = execSync("git diff --cached").toString();

    if (!diff.trim()) {
      core.info("No staged changes found.");
      return;
    }

    const prompt = `
Generate a git commit message for this diff. 
Language: ${lang}.
Format: conventional commits. 
Diff:\n${diff}
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      }
    );

    const message = response.data.choices[0].message.content.trim();
    core.info("Generated commit message:\n" + message);

    execSync(`git commit -m "${message.replace(/"/g, '\\"')}"`, {
      stdio: "inherit",
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
