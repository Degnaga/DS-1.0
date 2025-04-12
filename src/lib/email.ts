"use server";

type EmailParams = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(params: EmailParams) {
  try {
    // Use relative URL when running on the server
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/email`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    return await response.json();
  } catch (error) {
    console.error("Email sending error:", error);
    // Return a standardized error object instead of throwing
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
