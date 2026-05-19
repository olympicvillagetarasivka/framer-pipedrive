export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;
  const PIPEDRIVE_API_TOKEN = process.env.PIPEDRIVE_API_TOKEN;

  try {
    // Створюємо контакт у Pipedrive
    const personRes = await fetch(
      `https://api.pipedrive.com/v1/persons?api_token=${PIPEDRIVE_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || "Невідомий",
          email: email ? [{ value: email, primary: true }] : [],
          phone: phone ? [{ value: phone, primary: true }] : [],
        }),
      }
    );
    const personData = await personRes.json();
    const personId = personData.data?.id;

    // Створюємо Лід і прив'язуємо контакт
    await fetch(
      `https://api.pipedrive.com/v1/leads?api_token=${PIPEDRIVE_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Зворотній зв'язок від ${name || email || "сайту"}`,
          person_id: personId,
          note: message || "",
        }),
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Помилка сервера" });
  }
}
