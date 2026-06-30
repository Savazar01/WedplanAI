#!/usr/bin/env node

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');

const API_KEY = process.env.WEDPLANAI_API_KEY || "";
const BASE_URL = process.env.WEDPLANAI_BASE_URL || "http://localhost:3044";

// Error logging helper to log to stderr (so it doesn't mess up stdio JSON-RPC protocol)
function logError(msg, err) {
  fs.writeSync(2, `[WedPlanAI MCP Server] ${msg} ${err ? (err.stack || err.message || err) : ''}\n`);
}

async function apiRequest(path, method = 'GET', body = null) {
  const url = `${BASE_URL.replace(/\/$/, '')}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY
  };
  
  const options = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${text}`);
    }
    
    return await response.json();
  } catch (error) {
    logError(`API Request failed for ${method} ${path}`, error);
    throw error;
  }
}

function getToolsList() {
  return [
    {
      name: "get_wedding",
      description: "Retrieve a wedding event details. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_wedding",
      description: "Create a new wedding event with tradition-based seeding of ceremonies and tasks.",
      inputSchema: {
        type: "object",
        properties: {
          partnerA: { type: "string", description: "Name of partner A (required)" },
          partnerB: { type: "string", description: "Name of partner B (required)" },
          brideFather: { type: "string" },
              brideMother: { type: "string" },
          groomFather: { type: "string" },
              groomMother: { type: "string" },
          tradition: { type: "string", description: "Wedding tradition: hindu, muslim, sikh, christian, secular (required)" },
          weddingDate: { type: "string", description: "Wedding date (future ISO date string, required)" },
          location: { type: "string", description: "Wedding location/venue (required)" },
          budget: { type: "number", description: "Total wedding budget" },
          guestCount: { type: "number", description: "Estimated guest count" },
          locationName: { type: "string", description: "Venue/Event Space Name" },
          street: { type: "string" },
          city: { type: "string" },
          state: { type: "string" },
          country: { type: "string", description: "Country (default: India)" },
          pincode: { type: "string" },
          description: { type: "string", description: "General wedding description" },
          locationOptions: { type: "array", items: { type: "string" }, description: "Additional venue options" }
        },
        required: ["partnerA", "partnerB", "tradition", "weddingDate", "location"]
      }
    },
    {
      name: "update_wedding",
      description: "Update wedding details. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          partnerA: { type: "string", description: "Name of partner A" },
          partnerB: { type: "string", description: "Name of partner B" },
          brideFather: { type: "string" },
              brideMother: { type: "string" },
          groomFather: { type: "string" },
              groomMother: { type: "string" },
          weddingDate: { type: "string", description: "Wedding date (future ISO date string)" },
          tradition: { type: "string", description: "Wedding tradition" },
          location: { type: "string", description: "Wedding location/city" },
          budget: { type: "number", description: "Total wedding budget" },
          guestCount: { type: "number", description: "Estimated guest count" },
          description: { type: "string", description: "General wedding description" },
          showcaseTemplate: { type: "string", description: "Design template for the showcase page" },
          showcaseTopLabel: { type: "string", description: "Top welcome banner label for the showcase page" }
        }
      }
    },
    {
      name: "list_guests",
      description: "List all guests. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_guest",
      description: "Create/invite a new guest. For global API keys, provide weddingId in body.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          name: { type: "string", description: "Full name of the guest" },
          email: { type: "string", description: "Email address" },
          phone: { type: "string", description: "Phone number" },
          rsvpStatus: { type: "string", enum: ["pending", "attending", "declined"], description: "RSVP response status" },
          plusOneCount: { type: "number", description: "Number of plus-ones allowed/attending" },
          dietaryRestrictions: { type: "string", description: "Any dietary restrictions" },
          invitedCeremonies: { type: "string", description: "Ceremonies guest is invited to (e.g. 'all' or comma-separated IDs)" }
        },
        required: ["name"]
      }
    },
    {
      name: "update_guest",
      description: "Update an existing guest's details.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the guest to update" },
          name: { type: "string", description: "Full name of the guest" },
          email: { type: "string", description: "Email address" },
          phone: { type: "string", description: "Phone number" },
          rsvpStatus: { type: "string", enum: ["pending", "attending", "declined"], description: "RSVP response status" },
          plusOneCount: { type: "number", description: "Number of plus-ones allowed/attending" },
          dietaryRestrictions: { type: "string", description: "Any dietary restrictions" },
          invitedCeremonies: { type: "string", description: "Ceremonies guest is invited to" }
        },
        required: ["id"]
      }
    },
    {
      name: "delete_guest",
      description: "Delete a guest by ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the guest to delete" }
        },
        required: ["id"]
      }
    },
    {
      name: "list_tasks",
      description: "List all wedding tasks. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_task",
      description: "Create a new wedding task. For global API keys, provide weddingId in body.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Detailed description" },
          status: { type: "string", enum: ["backlog", "todo", "in_progress", "done"], description: "Task status" },
          columnId: { type: "string", description: "Kanban column ID" },
          dueDate: { type: "string", description: "Due date (ISO string)" },
          category: { type: "string", description: "Task category (e.g. catering, apparel)" },
          assignedUserId: { type: "string", description: "ID of the team member assigned" },
          ceremonyId: { type: "string", description: "ID of the ceremony linked to the task" }
        },
        required: ["title"]
      }
    },
    {
      name: "update_task",
      description: "Update an existing task.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the task to update" },
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Detailed description" },
          status: { type: "string", enum: ["backlog", "todo", "in_progress", "done"], description: "Task status" },
          columnId: { type: "string", description: "Kanban column ID" },
          dueDate: { type: "string", description: "Due date (ISO string)" },
          category: { type: "string", description: "Task category" },
          assignedUserId: { type: "string", description: "ID of the team member assigned" },
          ceremonyId: { type: "string", description: "ID of the ceremony linked to the task" }
        },
        required: ["id"]
      }
    },
    {
      name: "delete_task",
      description: "Delete a task by ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the task to delete" }
        },
        required: ["id"]
      }
    },
    {
      name: "list_ceremonies",
      description: "List all wedding ceremonies. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_ceremony",
      description: "Create a new wedding ceremony. For global API keys, provide weddingId in body.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          name: { type: "string", description: "Name of the ceremony (e.g. Reception, Haldi)" },
          description: { type: "string", description: "Ceremony description" },
          startTime: { type: "string", description: "Start time (ISO date string)" },
          endTime: { type: "string", description: "End time (ISO date string)" },
          location: { type: "string", description: "Ceremony venue/location" },
          isFoodServed: { type: "boolean", description: "Whether food is served at this ceremony" },
          dressCode: { type: "string", description: "Dress code requirements" },
          extraChecklist: { type: "string", description: "Extra checklist items" },
          assignedUserId: { type: "string", description: "ID of the team member assigned" }
        },
        required: ["name", "startTime", "endTime", "location"]
      }
    },
    {
      name: "update_ceremony",
      description: "Update an existing ceremony.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the ceremony to update" },
          name: { type: "string", description: "Name of the ceremony" },
          description: { type: "string", description: "Ceremony description" },
          startTime: { type: "string", description: "Start time (ISO date string)" },
          endTime: { type: "string", description: "End time (ISO date string)" },
          location: { type: "string", description: "Ceremony venue/location" },
          isFoodServed: { type: "boolean", description: "Whether food is served at this ceremony" },
          dressCode: { type: "string", description: "Dress code" },
          extraChecklist: { type: "string", description: "Extra checklist" },
          assignedUserId: { type: "string", description: "ID of the team member assigned" }
        },
        required: ["id"]
      }
    },
    {
      name: "delete_ceremony",
      description: "Delete a ceremony by ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the ceremony to delete" }
        },
        required: ["id"]
      }
    },
    {
      name: "list_vendors",
      description: "List all wedding vendors. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_vendor",
      description: "Create a new wedding vendor. For global API keys, provide weddingId in body.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          name: { type: "string", description: "Vendor name" },
          category: { type: "string", description: "Vendor category (e.g. catering, photography)" },
          contactName: { type: "string", description: "Contact person name" },
          phone: { type: "string", description: "Phone number" },
          email: { type: "string", description: "Email address" },
          totalCost: { type: "number", description: "Total contract cost" },
          paidAmount: { type: "number", description: "Amount paid so far" },
          status: { type: "string", description: "Vendor booking/contract status" }
        },
        required: ["name", "category"]
      }
    },
    {
      name: "update_vendor",
      description: "Update an existing vendor.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the vendor to update" },
          name: { type: "string", description: "Vendor name" },
          category: { type: "string", description: "Vendor category" },
          contactName: { type: "string", description: "Contact person name" },
          phone: { type: "string", description: "Phone number" },
          email: { type: "string", description: "Email address" },
          totalCost: { type: "number", description: "Total contract cost" },
          paidAmount: { type: "number", description: "Amount paid so far" },
          status: { type: "string", description: "Vendor booking/contract status" }
        },
        required: ["id"]
      }
    },
    {
      name: "delete_vendor",
      description: "Delete a vendor by ID.",
      inputSchema: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID of the vendor to delete" }
        },
        required: ["id"]
      }
    },
    {
      name: "list_chat_messages",
      description: "List all chat messages. For global API keys, provide weddingId.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" }
        }
      }
    },
    {
      name: "create_chat_message",
      description: "Create a new chat message. For global API keys, provide weddingId in body.",
      inputSchema: {
        type: "object",
        properties: {
          weddingId: { type: "string", description: "Wedding ID (required for global API keys)" },
          senderName: { type: "string", description: "Name of the sender" },
          senderEmail: { type: "string", description: "Email of the sender" },
          senderRole: { type: "string", description: "Role of the sender (admin, user, client, guest)" },
          message: { type: "string", description: "Chat message content" }
        },
        required: ["senderName", "senderRole", "message"]
      }
    }
  ];
}

async function callTool(name, args) {
  let result;

  // Helper: build query string with optional weddingId for global keys
  const qs = (args && args.weddingId) ? `?weddingId=${encodeURIComponent(args.weddingId)}` : '';
  // Helper: strip weddingId from args for create tools (it goes in the body as weddingId field for global keys)
  const bodyArgs = (args) => {
    if (!args || !args.weddingId) return args;
    return { ...args, weddingId: args.weddingId }; // API accepts weddingId in body for global keys
  };

  switch (name) {
    case 'get_wedding':
      result = await apiRequest(`/api/v1/wedding${qs}`, 'GET');
      break;
    case 'create_wedding':
      result = await apiRequest('/api/v1/wedding', 'POST', args);
      break;
    case 'update_wedding':
      result = await apiRequest(`/api/v1/wedding${qs}`, 'PUT', bodyArgs(args));
      break;
    case 'list_guests':
      result = await apiRequest(`/api/v1/guests${qs}`, 'GET');
      break;
    case 'create_guest':
      result = await apiRequest('/api/v1/guests', 'POST', bodyArgs(args));
      break;
    case 'update_guest':
      result = await apiRequest(`/api/v1/guests/${args.id}`, 'PUT', args);
      break;
    case 'delete_guest':
      result = await apiRequest(`/api/v1/guests/${args.id}`, 'DELETE');
      break;
    case 'list_tasks':
      result = await apiRequest(`/api/v1/tasks${qs}`, 'GET');
      break;
    case 'create_task':
      result = await apiRequest('/api/v1/tasks', 'POST', bodyArgs(args));
      break;
    case 'update_task':
      result = await apiRequest(`/api/v1/tasks/${args.id}`, 'PUT', args);
      break;
    case 'delete_task':
      result = await apiRequest(`/api/v1/tasks/${args.id}`, 'DELETE');
      break;
    case 'list_ceremonies':
      result = await apiRequest(`/api/v1/ceremonies${qs}`, 'GET');
      break;
    case 'create_ceremony':
      result = await apiRequest('/api/v1/ceremonies', 'POST', bodyArgs(args));
      break;
    case 'update_ceremony':
      result = await apiRequest(`/api/v1/ceremonies/${args.id}`, 'PUT', args);
      break;
    case 'delete_ceremony':
      result = await apiRequest(`/api/v1/ceremonies/${args.id}`, 'DELETE');
      break;
    case 'list_vendors':
      result = await apiRequest(`/api/v1/vendors${qs}`, 'GET');
      break;
    case 'create_vendor':
      result = await apiRequest('/api/v1/vendors', 'POST', bodyArgs(args));
      break;
    case 'update_vendor':
      result = await apiRequest(`/api/v1/vendors/${args.id}`, 'PUT', args);
      break;
    case 'delete_vendor':
      result = await apiRequest(`/api/v1/vendors/${args.id}`, 'DELETE');
      break;
    case 'list_chat_messages':
      result = await apiRequest(`/api/v1/chat-messages${qs}`, 'GET');
      break;
    case 'create_chat_message':
      result = await apiRequest('/api/v1/chat-messages', 'POST', bodyArgs(args));
      break;
    default:
      throw new Error(`Tool not found: ${name}`);
  }
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2)
      }
    ]
  };
}

async function handleMessage(message) {
  const { jsonrpc, id, method, params } = message;
  
  if (jsonrpc !== '2.0') {
    sendError(id, -32600, "Invalid Request");
    return;
  }
  
  if (id === undefined || id === null) {
    return;
  }
  
  switch (method) {
    case 'initialize':
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: "wedplanai-mcp",
          version: "1.1.0"
        }
      });
      break;
      
    case 'tools/list':
      sendResponse(id, {
        tools: getToolsList()
      });
      break;
      
    case 'tools/call':
      try {
        const result = await callTool(params.name, params.arguments);
        sendResponse(id, result);
      } catch (error) {
        sendError(id, -32603, error.message);
      }
      break;
      
    default:
      sendError(id, -32601, `Method not found: ${method}`);
  }
}

function sendResponse(id, result) {
  const response = {
    jsonrpc: '2.0',
    id,
    result
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message, data) {
  const response = {
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
      ...(data ? { data } : {})
    }
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

let buffer = '';
process.stdin.on('data', (chunk) => {
  buffer += chunk.toString('utf8');
  let lines = buffer.split('\n');
  buffer = lines.pop();
  
  for (const line of lines) {
    if (line.trim() === '') continue;
    try {
      const message = JSON.parse(line);
      handleMessage(message).catch((err) => {
        logError('Error handling message', err);
        sendError(message.id, -32603, err.message);
      });
    } catch (e) {
      sendError(null, -32700, "Parse error: " + e.message);
    }
  }
});

process.on('uncaughtException', (err) => {
  logError('Uncaught exception', err);
});

process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled rejection', reason);
});
