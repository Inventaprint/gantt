const slugify = require('slugify');

const slugifyPath = path => slugify(path.toLowerCase(), '-');

const statusPrettier = {
    WAITING_FOR_QUOTE: 'Pending',
    PROPOSED: 'Proposed',
    EXPIRED: 'Expired',
    IN_PROCESS: 'In Process',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    REORDER_REQUEST: 'Pending Reorder'
};

export default class Popup {
    constructor(parent, custom_html) {
        this.parent = parent;
        this.custom_html = custom_html;
        this.make();
    }

    make() {
        this.parent.innerHTML = `
            <div class="title"></div>
            <div class="status"></div>
            <div class="subtitle"></div>
            <div class="dateOrdered"></div>
            <div class="leadTime"></div>
            <div class="estShipmentDate"></div>
            <div class="dateShipped"></div>
            <div class="nav1">View RFP</div>
            <div class="nav2">View Order</div>
            <div class="pointer"></div>
        `;

        this.hide();

        this.title = this.parent.querySelector('.title');
        this.status = this.parent.querySelector('.status');
        this.subtitle = this.parent.querySelector('.subtitle');
        this.dateOrdered = this.parent.querySelector('.dateOrdered');
        this.leadTime = this.parent.querySelector('.leadTime');
        this.estShipmentDate = this.parent.querySelector('.estShipmentDate');
        this.dateShipped = this.parent.querySelector('.dateShipped');
        this.nav1 = this.parent.querySelector('.nav1');
        this.nav2 = this.parent.querySelector('.nav2');
        this.pointer = this.parent.querySelector('.pointer');
    }

    show(options) {
        if (!options.target_element) {
            throw new Error('target_element is required to show popup');
        }
        if (!options.position) {
            options.position = 'left';
        }
        const target_element = options.target_element;

        if (this.custom_html) {
            let html = this.custom_html(options.task);
            html += '<div class="pointer"></div>';
            this.parent.innerHTML = html;
            this.pointer = this.parent.querySelector('.pointer');
        } else {
            // set data
            const navToRFP = () =>
                options.task.history.replace({
                    pathname: `/innovator/${slugifyPath(
                        options.task.nav1.projectName
                    )}/${options.task.nav1.projectId}/${slugifyPath(
                        options.task.nav1.componentName
                    )}/${options.task.nav1.componentId}`,
                    search: `?r=${options.task.nav1.proposalId}`,
                    state: { rFP: options.task.nav1.proposalId }
                });

            const navToOrder = () =>
                options.task.history.replace({
                    pathname: `/innovator/orders`,
                    search: `?r=${options.task.nav2.orderId}`,
                    state: { order: options.task.nav2.orderId }
                });

            this.title.innerHTML = options.title;
            this.status.innerHTML =
                statusPrettier[options.task.metadata.status];
            options.task.metadata.status === 'IN_PROCESS'
                ? (this.status.style.color = '#279327')
                : options.task.metadata.status === 'SHIPPED' &&
                  (this.status.style.color = '#A333C8');

            this.subtitle.innerHTML = options.subtitle;

            this.dateOrdered.innerHTML = options.task.metadata.dateOrdered;
            this.leadTime.innerHTML = options.task.metadata.leadTime;
            this.estShipmentDate.innerHTML =
                options.task.metadata.estShipmentDate;
            this.dateShipped.innerHTML = options.task.metadata.dateShipped;

            this.nav1.onclick = navToRFP;

            this.nav2.onclick = navToOrder;

            this.parent.style.width = this.parent.clientWidth + 'px';
        }

        // set position
        let position_meta;
        if (target_element instanceof HTMLElement) {
            position_meta = target_element.getBoundingClientRect();
        } else if (target_element instanceof SVGElement) {
            position_meta = options.target_element.getBBox();
        }

        if (options.position === 'left') {
            this.parent.style.left =
                position_meta.x + (position_meta.width + 10) + 'px';
            this.parent.style.top = position_meta.y + 'px';

            this.pointer.style.transform = 'rotateZ(90deg)';
            this.pointer.style.left = '-7px';
            this.pointer.style.top = '2px';
        }

        // show
        this.parent.style.opacity = 1;
    }

    hide() {
        this.parent.style.opacity = 0;
    }
}
