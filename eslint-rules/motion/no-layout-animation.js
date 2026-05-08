'use strict';

const BANNED_PROPS = new Set([
  'width', 'height', 'top', 'left', 'right', 'bottom',
  'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight',
  'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight',
]);

/**
 * Inside framer-motion `animate={...}`, `initial={...}`, `exit={...}`, `whileHover`, `whileTap`,
 * disallow animating layout-triggering CSS properties — only transform/opacity
 * are permitted (compositor-accelerated).
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow animating layout-triggering CSS properties in framer-motion' },
    schema: [],
    messages: {
      banned: "Animating '{{prop}}' triggers layout. Use transform (x, y, scale) or opacity instead.",
    },
  },
  create(context) {
    function isMotionAnimateAttr(name) {
      return name === 'animate' || name === 'initial' || name === 'exit' || name === 'whileHover' || name === 'whileTap';
    }
    return {
      JSXAttribute(node) {
        if (!isMotionAnimateAttr(node.name && node.name.name)) return;
        const expr = node.value && node.value.expression;
        if (!expr || expr.type !== 'ObjectExpression') return;
        expr.properties.forEach((prop) => {
          if (prop.type !== 'Property') return;
          const key = prop.key.name || prop.key.value;
          if (BANNED_PROPS.has(key)) {
            context.report({ node: prop, messageId: 'banned', data: { prop: key } });
          }
        });
      },
    };
  },
};
