import { markupPartial } from './helpers.js'; 

export default ({id, heading, summary, className}) => markupPartial(`
<aside class="${className}" id="sidebar-${id}">
	<header>
		<div>${heading}</div>
	</header>
	<article>
		${summary}
	</article>

	<ul>
		<li><a href="#">ONE</a></li>
		<li><a href="#">TWO</a></li>
		<li><a href="#">THREE</a></li>
		<li><a href="#">FOUR</a></li>
	</ul>
</aside>
`);