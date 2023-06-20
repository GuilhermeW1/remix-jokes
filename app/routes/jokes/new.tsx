import type { ActionFunction, ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

import { db } from '~/utils/db.server'

export let action: ActionFunction = async ({request}: ActionArgs) => {
  const form = await request.formData()
  const name = form.get('name')
  const content = form.get('content')

  if(typeof name !== 'string' || typeof content !== 'string'){
    throw new Error('Form submitted incorrectly')
  }

  let joke = await db.joke.create({
    data: {name, content}
  })
  return redirect(`/jokes/${joke.id}`) 
}

export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name: <input type="text" name="name" />
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name="content" />
          </label>
        </div>
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
