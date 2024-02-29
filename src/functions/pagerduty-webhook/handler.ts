import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";

import axios from "axios";
import schema from "./schema";

/**
 * This function is the main entrypoint for the pagerduty webhook event
 */
const pagerdutyWebhook: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  const firstMessage = event.body.messages[0];
  if (!firstMessage) {
    return formatJSONResponse({
      message: "No messages in PagerDuty event",
    });
  }

  const incidentId = firstMessage.incident.id;
  const incidentNumber = firstMessage.incident.incident_number;
  if (!incidentId) {
    return formatJSONResponse({
      message: "No incident id in PagerDuty event",
    });
  }

  const link = await createSwitchboardRoom(incidentNumber);
  await respondToPagerDuty(incidentId, link);

  return formatJSONResponse({
    message: "Received PagerDuty webook event",
  });
};

/**
 * Creates a Switchboard room by calling the Switchboard API. You can customize the room name and other paremeters here.
 * @param incidentNumber The PagerDuty incident number to use in the room name
 * @returns the link to the created room
 */
const createSwitchboardRoom = async (incidentNumber: string) => {
  const SB_API_KEY = process.env.SB_API_KEY;
  const SB_WORKSPACE_ID = process.env.SB_WORKSPACE_ID;
  const API_BASE_URL =
    process.env.API_BASE_URL || "https://beta-api.beta.switchboard.app";

  const options = {
    method: "POST",
    url: `${API_BASE_URL}/api/v1/create-room`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `${SB_API_KEY}`,
    },
    data: {
      // Customize the room name here if you want a different naming scheme
      name: `PagerDuty Incident ${incidentNumber}`,
      workspaceId: SB_WORKSPACE_ID,
      // Use this if you want to create a room from a template
      // templateRoomId: "TEMPLATE_ROOM_ID",
    },
  };

  try {
    const { data } = await axios.request(options);
    return data.link;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Responds to the PagerDuty incident with a note containing the link to the created Switchboard room
 * @param incidentId The PagerDuty incident id
 * @param sbLink The link to the created Switchboard room
 */
const respondToPagerDuty = async (incidentId: string, sbLink: string) => {
  const PD_API_KEY = process.env.PD_API_KEY;
  const PD_FROM_EMAIL = process.env.PD_FROM_EMAIL;

  const options = {
    method: "POST",
    url: `https://api.pagerduty.com/incidents/${incidentId}/notes`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      From: PD_FROM_EMAIL,
      Authorization: `Token token=${PD_API_KEY}`,
    },
    data: { note: { content: `Switchboard room was created: ${sbLink}` } },
  };

  try {
    await axios.request(options);
  } catch (error) {
    console.error(error);
  }
};

export const main = middyfy(pagerdutyWebhook);
