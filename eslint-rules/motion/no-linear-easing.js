'use strict';

/**
 * Bans `linear` easing in motion code. The motion system requires non-linear
 * easings (bezier or spring). Linear feels mechanical and breaks the
 * Pavlovian-consistency rule.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: "Disallow 'linear' easing in motion code" },
    schema: [],
    messages: {
      banned: "Linear easing is banned. Use a token from motionEase (out, inOut, inkWrite) or a spring.",
    },
  },
  create(context) {
    function checkValue(node, value) {
      if (typeof value === 'string' && value.toLowerCase() === 'linear') {
        context.report({ node, messageId: 'banned' });
      }
    }
    return {
      Property(node) {
        const key = node.key && (node.key.name || node.key.value);
        if (key !== 'ease' && key !== 'easing' && key !== 'transitionTimingFunction') return;
        if (node.value.type === 'Literal') checkValue(node.value, node.value.value);
      },
      TemplateLiteral(node) {
        node.quasis.forEach((q) => {
          if (/\blinear\b/.test(q.value.raw)) {
            context.report({ node: q, messageId: 'banned' });
          }
        });
      },
    };
  },
};
