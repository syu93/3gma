import { createProject, getProjectList } from "./firebase";

export function createProjectItem({ id, name, thumbnail }) {
  const template = document.createElement("template");
  template.innerHTML = `
  <li class="w-1/5 aspect-video rounded-md shadow-md overflow-hidden">
    <a class="flex flex-col w-full h-full" href="/editor/${id}">
      <img class="flex-1 bg-zinc-500" src="${thumbnail}" alt="">
      <h1 class="py-1 px-2">${name}</h1>
    </a>
  </li>
`;
  return template.content.cloneNode(true);
}

export async function initHomePage() {
  const projectContainer = document.querySelector("#projectContainer");
  const projectList = projectContainer?.querySelector("ul");
  const createProjectButton = document.querySelector("#newProject");

  getProjectList(project => projectList?.appendChild(createProjectItem(project)));

  createProjectButton?.addEventListener("click", () => {
    const name = prompt("Project name");
    if (name) {
      createProject(name);
    }
  });
}
