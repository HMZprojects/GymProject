const form = document.getElementById('dietForm');
const output = document.getElementById('output');
async function fetchWithRetry(prompt, retries = 3, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyArE54494-Ekbi1sAiZrTqGAeTQ7qNWmwg",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!response.ok) throw await response.json();
      return await response.json();

    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`Retrying in ${delay/1000}s due to error...`, err);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  output.innerHTML = "⏳ إنشاء خطة النظام الغذائي الخاص بك ";

  const data = {
    weight: document.getElementById('weight').value,
    height: document.getElementById('height').value,
    age: document.getElementById('age').value,
    currency: document.getElementById('currency').value,
    disease: document.getElementById('disease').value,
    comments: document.getElementById('comments').value,
  };

  const prompt = `
    Create a personalized daily diet plan for this person:
    - Weight: ${data.weight} kg
    - Height: ${data.height} cm
    - Age: ${data.age}
    - Disease: ${data.disease || "none"}
    - Notes: ${data.comments}
    - Currency: ${data.currency}

    Include:
    1. Recommended breakfast
    2. Recommended dinner
    3. Important dietary tips
    i want all the answers on arabic language.
    Provide the response in a clear, structured format without *****.
    i want it to be exactly like that:
    الإفطار الموصى به:[your answer]
    العشاء الموصى به:[your answer]
    نصائح غذائية مهمة:[your answer]
    نصيحة 1: ...
    نصيحة 2: ...
    نصيحة 3: ...
    etc
    i want the subtitles to be in bold
    i dont want any other text or or ponctuations like ... ### ---- ect; especially overused ponctions; keep it simple`;

  try {
    const result = await fetchWithRetry(prompt);

    console.log(result);

    let text = "⚠️ No response from Gemini.";
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        text = candidate.content.parts.map(p => p.text || "").join("\n");
      } else if (candidate.output && candidate.output[0]) {
        text = candidate.output[0].content || JSON.stringify(candidate.output[0]);
      }
    }

    output.innerHTML = `<h3></h3>${text.replace(/\n/g, '<br>')}`;

  } catch (err) {
    output.innerHTML = "❌ Error: " + JSON.stringify(err);
  }
});