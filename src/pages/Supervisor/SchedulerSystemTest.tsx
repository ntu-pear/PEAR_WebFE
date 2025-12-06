import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Play,
  CheckCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getSystemTest, type SystemTestData } from "@/api/scheduler/scheduler";
import { toast } from "sonner";

const SchedulerSystemTest: React.FC = () => {
  const [systemTestData, setSystemTestData] = useState<SystemTestData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortStatisticsData = (data: SystemTestData): SystemTestData => {
    const sortedStatistics = data.Statistics.map((stat) => {
      let sortedResults = stat.statsResult;

      if (stat.statsName === "Number of patients scheduled per activity") {
        // Sort numerically (assume format: 'Activity: Number')
        sortedResults = [...stat.statsResult].sort((a, b) => {
          const numA = parseInt(a.split(": ").pop() || "0", 10);
          const numB = parseInt(b.split(": ").pop() || "0", 10);
          return numB - numA;
        });
      } else if (
        stat.statsName === "Most scheduled activities" ||
        stat.statsName === "Least scheduled activities"
      ) {
        // Sort alphabetically
        sortedResults = [...stat.statsResult].sort((a, b) =>
          a.localeCompare(b)
        );
      }

      return {
        ...stat,
        statsResult: sortedResults,
      };
    });

    return {
      ...data,
      Statistics: sortedStatistics,
    };
  };

  const handleRunSystemTest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getSystemTest();

      if (response.Status === "200") {
        let sortedData = sortStatisticsData(response.Data);
        setSystemTestData(sortedData);
        toast.success("System test completed successfully.");
      } else {
        throw new Error(response.Message || "Failed to run system test");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      toast.error("System test failed: Failed to run system test.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTestResultBadge = (result: string) => {
    switch (result.toLowerCase()) {
      case "pass":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Pass
          </Badge>
        );
      case "fail":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Fail
          </Badge>
        );
      default:
        return <Badge variant="secondary">{result}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scheduler System Test
          </h1>
          <p className="text-gray-600">
            Developer page to validate the scheduler service functionality
          </p>
        </div>

        {/* Run Test Button */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              System Test Control
            </CardTitle>
            <CardDescription>
              Click the button below to run the scheduler service test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleRunSystemTest}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running System Test...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run System Test
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Empty State */}
        {!systemTestData && !error && !isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Test Results
              </h3>
              <p className="text-gray-600 mb-4">
                Click "Run System Test" to continue.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-red-50 p-3 rounded border mt-2 overflow-auto max-h-64">
                {error}
              </pre>
            </AlertDescription>
          </Alert>
        )}

        {/* Results Display */}
        {systemTestData && (
          <div className="space-y-6">
            {/* System Tests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  System Tests
                </CardTitle>
                <CardDescription>
                  Core system functionality validation results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemTestData.SystemTest.map((test, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {test.testName}
                        </h4>
                        {test.testRemarks.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {test.testRemarks.join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="ml-4">
                        {getTestResultBadge(test.testResult)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Statistics
                </CardTitle>
                <CardDescription>Scheduling statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {systemTestData.Statistics.map((stat, index) => (
                    <div key={index}>
                      <h4 className="font-medium text-gray-900 mb-3">
                        {stat.statsName}
                      </h4>
                      <div className="grid gap-2">
                        {stat.statsResult.map((result, resultIndex) => (
                          <div
                            key={resultIndex}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-sm text-gray-700">
                              {result}
                            </span>
                          </div>
                        ))}
                      </div>
                      {index < systemTestData.Statistics.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Warnings
                </CardTitle>
                <CardDescription>
                  System warnings and potential issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemTestData.Warnings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                      <p>No warnings detected.</p>
                    </div>
                  ) : (
                    systemTestData.Warnings.map((warning, index) => (
                      <Alert
                        key={index}
                        variant="default"
                        className="border-yellow-200 bg-yellow-50"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{warning.warningName}</AlertTitle>
                        {warning.warningRemarks.length > 0 && (
                          <AlertDescription>
                            {warning.warningRemarks.join(", ")}
                          </AlertDescription>
                        )}
                      </Alert>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulerSystemTest;
