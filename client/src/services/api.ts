import axios from "axios";
import type { Graph } from "../types";

const BASE_URL = "http://localhost:3000";

export async function fetchGraph(): Promise<Graph> {
  const res = await axios.get<Graph>(
    `${BASE_URL}/api/v1/1/actions/blueprints/test/graph`
  );
  return res.data;
}
