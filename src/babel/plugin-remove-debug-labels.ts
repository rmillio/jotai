import babel from '@babel/core'
import type { PluginObj } from '@babel/core'
import { isAtom } from './utils.ts'
import type { PluginOptions } from './utils.ts'

export default function debugLabelPlugin(
  { types: t }: typeof babel,
  options?: PluginOptions,
): PluginObj {
  return {
    visitor: {
      ExpressionStatement(path) {
        const { node } = path
        const expression = node.expression

        if (!t.isAssignmentExpression(expression)) {
          return
        }

        const left = expression.left

        if (!t.isMemberExpression(left)) {
          return
        }

        if (
          t.isIdentifier(left.property) &&
          left.property.name === 'debugLabel' &&
          t.isIdentifier(left.object)
        ) {
          const binding = path.scope.getBinding(left.object.name)

          if (binding && binding.path.isVariableDeclarator()) {
            const init = binding.path.node.init
            if (
              t.isCallExpression(init) &&
              isAtom(t, init.callee, options?.customAtomNames)
            ) {
              path.remove()
            }
          }
        }
      },
    },
  }
}
