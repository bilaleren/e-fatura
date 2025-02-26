import Listr from 'listr';

function createListr<T>(
  tasks: Listr.ListrTask<T>[],
  options?: Listr.ListrOptions<T>
): Listr {
  return new Listr<T>(tasks, options);
}

export default createListr;
