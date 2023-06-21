import type { ActionFunction, ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { useActionData } from '@remix-run/react'

import { db } from '~/utils/db.server'
import { badRequest } from '~/utils/request.server'

function validateJokeName(name:string){
  if(name.length < 3){
    return "Joke name must be at least 3 character long"
  }
}

function validateJokeContent(content:string){
  if(content.length < 10){
    return "Joke content must be at least 10 characters long"
  }
}

type ActionData = {
  formError?: string,
  fields?: {name?: string, content?: string},
  fieldErrors?: {name?: string, content?: string}
}

export let action: ActionFunction = async ({request}: ActionArgs): Promise<Response | ActionData> => {
  const form = await request.formData()
  const name = form.get('name')
  const content = form.get('content')

  if(typeof name !== 'string' || typeof content !== 'string'){
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "Form not submitted correctly.",
    });
  }

  let fieldErrors = {
    name: validateJokeName(name),
    content: validateJokeContent(content)
  }
  
  if(Object.values(fieldErrors).some(Boolean)){
    return badRequest({
      fieldErrors,
      fields: {name, content},
      formError: null,
    });
  }

  let joke = await db.joke.create({
    data: {name, content}
  })
  return redirect(`/jokes/${joke.id}`) 
}

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>() 
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              defaultValue={actionData?.fields?.name} 
              type="text" 
              name="name" 
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              aria-errormessage={actionData?.fieldErrors?.name 
                ? "name-error"
                : undefined  
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p
              className="form-validation-error"
              id="name-error"
              role="alert"
            >
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea 
              defaultValue={actionData?.fields?.content}
              name="content" 
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-errormessage={actionData?.fieldErrors?.content
                ? "content-error"
                : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              id="content-error"
              role="alert"
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        <div>
          {actionData?.formError ? (
            <p
              className="form-validation-error"
              role="alert"
            >
              {actionData.formError}
            </p>
          ) : null}
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
