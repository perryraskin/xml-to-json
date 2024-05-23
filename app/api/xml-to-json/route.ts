import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import xml2js from "xml2js";

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("Authorization");

    if (apiKey !== `Bearer ${process.env.XML_TO_JSON_API_KEY}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { url } = await request.json(); // Extract the URL from the request body

    // Fetch the XML content from the provided URL
    const response = await axios.get(url);
    const xmlData = response.data;

    // Convert XML to JSON
    const jsonResult = await xml2js.parseStringPromise(xmlData);

    // Sort the JSON response.rss.channel[0].item array by item.pubDate desc
    if (
      jsonResult.rss &&
      jsonResult.rss.channel &&
      jsonResult.rss.channel[0].item
    ) {
      jsonResult.rss.channel[0].item.sort((a: any, b: any) => {
        const dateA = new Date(a.pubDate).getTime();
        const dateB = new Date(b.pubDate).getTime();
        return dateB - dateA;
      });
    }

    // Return the JSON result
    return NextResponse.json(jsonResult.rss.channel[0].item);
  } catch (error) {
    console.error("Error converting XML to JSON:", error);
    return NextResponse.json(
      { message: "Failed to convert XML to JSON" },
      { status: 500 }
    );
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const url = searchParams.get("url"); // Extract the URL from the query parameters

//     if (!url) {
//       return NextResponse.json(
//         { message: "URL parameter is required" },
//         { status: 400 }
//       );
//     }

//     // Fetch the XML content from the provided URL
//     const response = await axios.get(url);
//     const xmlData = response.data;

//     // Convert XML to JSON
//     const jsonResult = await xml2js.parseStringPromise(xmlData);

//     // Sort the JSON response.rss.channel[0].item array by item.pubDate desc
//     if (
//       jsonResult.rss &&
//       jsonResult.rss.channel &&
//       jsonResult.rss.channel[0].item
//     ) {
//       jsonResult.rss.channel[0].item.sort((a: any, b: any) => {
//         const dateA = new Date(a.pubDate).getTime();
//         const dateB = new Date(b.pubDate).getTime();
//         return dateB - dateA;
//       });
//     }

//     // Return the JSON result
//     return NextResponse.json(jsonResult.rss.channel[0].item);
//   } catch (error) {
//     console.error("Error converting XML to JSON:", error);
//     return NextResponse.json(
//       { message: "Failed to convert XML to JSON" },
//       { status: 500 }
//     );
//   }
// }
