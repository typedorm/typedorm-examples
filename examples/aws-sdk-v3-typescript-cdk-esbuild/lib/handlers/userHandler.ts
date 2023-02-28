import { createUser, getUserById, User } from "../entities/UserEntity";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

type GetParams = {
  id: string;
};

export const handler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  let response: APIGatewayProxyResult = {
    body: "",
    statusCode: 200,
  };
  const method = event.httpMethod.toLowerCase() 
  switch (method) {
    case "get": {
      const { id } = event.queryStringParameters as unknown as GetParams;
      const resource = await getUserById(id);
      response.body = JSON.stringify(resource)
      break
    }
    case "post": {
      const resource = await createUser(event.body as unknown as User);
      response.body = JSON.stringify(resource);
      response.statusCode = 201;
      break
    }
    default:
      throw new Error(`${method} not supported`)
  }
  return response
};
