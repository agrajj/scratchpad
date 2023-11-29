import { log, table } from "console";

type PerfPublishType = {
  method_name: string;
  ts_start: Date;
  ts_end: Date;
  elapsed: number;
};

// const publish = (data: PerfPublishType){

// }

const DEBUG_TRACE = true;

const trace = () =>
  function <
    This,
    Args extends any[],
    Return,
    Fn extends (this: This, ...args: Args) => Return
  >(target: Fn, context: ClassMethodDecoratorContext<This, Fn>) {
    const method_name = String(context.name);

    return function (this: This, ...args: Args): Return {
      type Prop = {
        type: "start" | "end";
        method_name: string;
        started_at: Date;
        id: string | number;
      };
      type Data = Prop;

      //FIXME: use nanoid instead of hardcoded value
      const id = 1;
      const data: Data = {
        id,
        type: "start",
        method_name,
        started_at: new Date(),
      };

      if (DEBUG_TRACE) {
        log(data);
        table(
          args.map((arg) => ({
            value: arg,
            type: typeof arg,
          }))
        );
      }
      // call the original method
      const result = target.call(this, ...args);
      const ended_at = new Date();

      const total_execution_time =
        ended_at.valueOf() - data.started_at.valueOf();
      const end_data: Data & { ended_at: Date } & {
        total_execution_time: number;
      } = {
        ...data,
        type: "end",
        ended_at: ended_at,
        total_execution_time,
      };

      if (DEBUG_TRACE) {
        log(end_data);
        table(result);
      }

      return result;
    };
  };

class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  @trace()
  intro(guest: string) {
    log(`${this.name} ${guest}`);
  }
}

const p = new Person("P1");
p.intro("P2");
p.intro("2");
p.intro("2");
p.intro("2");
