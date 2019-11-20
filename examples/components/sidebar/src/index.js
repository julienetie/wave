import view from './view.js';


const sidebar = {
    connect(config) {
        const { id, parent, className, data } = config;
        const props = {
            id,
            className,
            ...data
        }
        // Create component 
        const component = view(props);

        // Insert component
        parent.appendChild(component);
    }
}
console.log('AZ')
export default sidebar;