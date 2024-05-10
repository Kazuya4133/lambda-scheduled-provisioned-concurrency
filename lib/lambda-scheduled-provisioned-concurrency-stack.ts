import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as applicationautoscaling from 'aws-cdk-lib/aws-applicationautoscaling'

export class LambdaScheduledProvisionedConcurrencyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      functionName: "ScheduledProvisionedConcurrencyTestLambda",
      description: "スケジュールされたプロビジョニング済みの検証用Lambda",
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset(`../scheduled_provisioned_concurrency/lib`),
    });

    // バージョンの設定
    const lambdaVersion = new lambda.Version(this, 'LambdaVersion', {
      lambda: lambdaFunction,
      description: 'Version for Provisioned Concurrency',
    });

    // オートスケーリングのターゲットの設定
    const scalingTarget = new applicationautoscaling.ScalableTarget(this, 'ScalableTarget', {
      serviceNamespace: applicationautoscaling.ServiceNamespace.LAMBDA,
      minCapacity: 3,
      maxCapacity: 30,
      resourceId: `function:${lambdaFunction.functionName}:${lambdaVersion.version}`,
      scalableDimension: 'lambda:function:ProvisionedConcurrency',
    });

    // スケジュールされたスケーリングポリシーの追加
    scalingTarget.scaleOnSchedule('ScaleOut', {
      schedule: applicationautoscaling.Schedule.cron({ hour: '20', minute: '55' }), // JSTで5時55分
      minCapacity: 10,
      maxCapacity: 20,
    });

    scalingTarget.scaleOnSchedule('ScaleIn', {
      schedule: applicationautoscaling.Schedule.cron({ hour: '21', minute: '5'}),　// JSTで6時5分
      minCapacity: 1,
      maxCapacity: 2,
    });
  }
}